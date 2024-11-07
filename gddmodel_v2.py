# 使用魔法命令将代码写入文件，便于后续在其他Python环境中导入此模块

# 导入必要的模块
import datetime as dt  # 使用datetime模块进行日期和时间的操作
from pcse.base import SimulationObject, StatesTemplate, RatesTemplate, ParamTemplate  # 引入pcse库中用于构建模型的基本类
from pcse.traitlets import Float, Instance  # 引入Float和Instance类，用于定义参数和状态变量的类型
from pcse import signals  # 引入signals模块，用于发送信号

# 定义GrowingDegreeDayModelV2类，继承自SimulationObject
class GrowingDegreeDayModelV2(SimulationObject):
    """
    A simple model to accumulate growing degree days up till GDDatMaturity.
    The model stores the maturity date and triggers a crop_finish signal when maturity is reached.
    简单的模型，累积生长度日直到成熟所需的总度日数，储存成熟日期并在达到成熟时触发作物完成信号。
    """

    # 定义参数类
    class Parameters(ParamTemplate):
        BaseTemperature = Float  # 定义基温参数，类型为浮点数
        GDDatMaturity = Float  # 定义成熟所需总度日的参数，类型为浮点数

    # 定义状态变量类
    class StateVariables(StatesTemplate):
        GDD = Float  # 当前累积的生长度日，类型为浮点数
        DayofMaturity = Instance(dt.date)  # 成熟日期，类型为datetime.date实例

    # 定义速率变量类
    class RateVariables(RatesTemplate):
        rGDD = Float  # 当前的日生长度日速率，类型为浮点数

    # 初始化方法
    def initialize(self, day, kiosk, parameters):
        self.params = self.Parameters(parameters)  # 初始化参数
        self.states = self.StateVariables(kiosk, GDD=0.0, DayofMaturity=None)  # 初始化状态变量
        self.rates = self.RateVariables(kiosk)  # 初始化速率变量

    # 计算速率方法，每日调用
    def calc_rates(self, day, drv):
        self.rates.rGDD = max(0, drv.TEMP - self.params.BaseTemperature)  # 计算当前日的生长度日速率

    # 积分方法，每日调用
    def integrate(self, day, delt):
        self.states.GDD += self.rates.rGDD * delt  # 更新累积生长度日
        # 如果累积生长度日已经达到或超过成熟所需的总度日，则标记作物成熟并发送信号
        if self.states.GDD >= self.params.GDDatMaturity:
            self.states.DayofMaturity = day  # 设置作物成熟日期
            self._send_signal(day=day, signal=signals.crop_finish, crop_delete=True)  # 发送作物完成信号
