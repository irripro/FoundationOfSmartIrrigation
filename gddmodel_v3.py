
# 导入必要的模块和类
import datetime as dt
from pcse.base import SimulationObject, StatesTemplate, RatesTemplate, ParamTemplate
from pcse.util import doy, limit, AfgenTrait
from pcse.traitlets import Float, Instance
from pcse import signals

class GrowingDegreeDayModelV3(SimulationObject):
    """
    一个简单的模型用于累计生长度日直到达到成熟所需的度日数（GDD）。该模型
    存储成熟日期，并在达到成熟时触发作物结束信号。

    生长速率（rGDD）通过一个因子调整，该因子在水分胁迫下增加rGDD。
    """

    # 参数模板
    class Parameters(ParamTemplate):
        BaseTemperature = Float  # 基础温度
        GDDatMaturity = Float   # 成熟所需度日数
        MaxRelativeGDDincrease = Float  # 最大的相对GDD增长率

    # 状态变量模板
    class StateVariables(StatesTemplate):
        GDD = Float             # 当前累积度日
        DayofMaturity = Instance(dt.date)  # 成熟日期

    # 速率变量模板
    class RateVariables(RatesTemplate):
        rGDD = Float            # 当前生长度日速率

    # 初始化方法
    def initialize(self, day, kiosk, parameters):
        # 保存参数
        self.params = self.Parameters(parameters)
        # 初始化状态变量
        self.states = self.StateVariables(kiosk, GDD=0.0, DayofMaturity=None)
        # 初始化速率变量
        self.rates = self.RateVariables(kiosk)

    # 计算速率方法
    def calc_rates(self, day, drv):
        # 计算增强的GDD增长速率
        # 注意：WaterStressFactor由土壤模块提供，可以通过self.kiosk访问
        relGDDinc = 1.0 + self.params.MaxRelativeGDDincrease * self.kiosk.WaterStressFactor
        self.rates.rGDD = max(0, drv.TEMP - self.params.BaseTemperature) * relGDDinc

    # 积分更新方法
    def integrate(self, day, delt):
        self.states.GDD += self.rates.rGDD * delt
        if self.states.GDD >= self.params.GDDatMaturity:
            self.states.DayofMaturity = day
            # 当成熟时发送信号
            self._send_signal(day=day, signal=signals.crop_finish, crop_delete=True)


# 基本土壤水分模型
class BasicSoilWaterModel(SimulationObject):

    # 参数模板
    class Parameters(ParamTemplate):
        FieldCapacity = Float          # 田间持水量
        WiltingPoint = Float           # 凋萎点
        SeasonalSoilMoisture = AfgenTrait  # Afgen是一个线性插值对象

    # 状态变量模板
    class StateVariables(StatesTemplate):
        SoilMoisture = Float           # 土壤湿度
        WaterStressFactor = Float      # 水分胁迫因子

    # 初始化方法
    def initialize(self, day, kiosk, parameters):
        self.params = self.Parameters(parameters)
        # 计算临界水平，即田间持水量与凋萎点之间的中点
        self._critical_level = (self.params.FieldCapacity + self.params.WiltingPoint)/2.0
    
        # 根据日期获取土壤湿度
        SM = self.params.SeasonalSoilMoisture(doy(day))
        self.states = self.StateVariables(kiosk, SoilMoisture=SM, WaterStressFactor=0.0, publish=["WaterStressFactor"])

    # 计算速率方法
    def calc_rates(self, day, drv):
        # 此模型没有动力学，因此无需计算变化率
        pass

    # 积分更新方法
    def integrate(self, day, delt):
        # 通过基于日历年插值获取土壤湿度，Afgen负责线性插值
        self.states.SoilMoisture = self.params.SeasonalSoilMoisture(doy(day))
        # 计算水分胁迫因子，并限制在0到1之间
        WSF = (self._critical_level - self.states.SoilMoisture)/(self._critical_level - self.params.WiltingPoint)
        self.states.WaterStressFactor = limit(0.0, 1.0, WSF)
