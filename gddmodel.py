# 使用%%writefile命令将代码写入文件gddmodel.py


# 这里我们导入PCSE中的一些组件，它们是构建任何模型的基本组成部分。
from pcse.base import SimulationObject, StatesTemplate, RatesTemplate, ParamTemplate
from pcse.traitlets import Float

# 在PCSE中的模型总是继承自SimulationObject
class GrowingDegreeDayModel(SimulationObject):
    """一个简单的模型，用于在作物生长周期的开始和结束之间积累生长度日。"""

    # 这定义了模型参数。它继承自ParamTemplate，这确保参数接收其值，并在参数缺失时发出信号。
    class Parameters(ParamTemplate):
        # 定义基温参数
        BaseTemperature = Float

    # 状态变量总是继承自StatesTemplate。StatesTemplate提供了某些行为，
    # 如状态变量必须被初始化。
    class StateVariables(StatesTemplate):
        # 定义生长度日状态变量
        GDD = Float

    # 速率变量类似于状态变量，但会自动初始化为零。
    class RateVariables(RatesTemplate):
        # 定义生长度日的变化率
        rGDD = Float

    def initialize(self, day, kiosk, parameters):
        """初始化仅在模型启动时运行一次。
        
        它始终有三个变量：
        - day: 模型开始的日期
        - kiosk: 变量Kiosk，这是一个在模型组件间共享的对象
        - parameters: 提供模型参数的对象
        """
        # 下面的代码初始化参数、状态和速率变量。
        # 注意状态变量（这里：GDD）必须提供初始值。
        self.params = self.Parameters(parameters)
        self.states = self.StateVariables(kiosk, GDD=0.0)
        self.rates = self.RateVariables(kiosk)

    def calc_rates(self, day, drv):
        """计算在当前日期发生的改变率。
        
        它始终有两个变量：
        - 当前日期（一个日期）
        - 驱动变量`drv`，包含气象输入
        """
        # 这里我们计算GDD的增加，并将其赋值给速率变量rGDD
        self.rates.rGDD = max(0.0, drv.TEMP - self.params.BaseTemperature)

    def integrate(self, day, delt):
        """这执行速率变化对状态的积分。
        
        它始终有两个变量：
        - 当前日期
        - 时间步长，固定为1.0天
        """
        # 这里我们将rGDD乘以delt加到GDD上。
        # 与`delt`相乘主要是为了教育目的（因为delt=1.0），尽管这在未来可能会改变。
        self.states.GDD += self.rates.rGDD * delt
