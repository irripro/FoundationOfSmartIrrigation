# 导入必要的模块和类
import datetime as dt
from pcse.base import SimulationObject, StatesTemplate, RatesTemplate, ParamTemplate
from pcse.util import doy, limit, AfgenTrait
from pcse.traitlets import Float, Instance
from pcse import signals
import sqlite3

class GrowingDegreeDayModelV3(SimulationObject):
    """一个简单的模型用于累计生长度日直到达到成熟所需的度日数（GDD）。该模型
    存储成熟日期，并在达到成熟时触发作物结束信号。
    
    新增参数以接受作物品种和种植区域。
    """
    
    # 新增参数
    class Parameters(ParamTemplate):
        BaseTemperature = Float  # 基础温度
        GDDatMaturity = Float   # 成熟所需度日数
        MaxRelativeGDDincrease = Float  # 最大的相对GDD增长率
        CropVariety = Float      # 作物品种
        PlantingArea = Float     # 种植区域

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
        relGDDinc = 1.0 + self.params.MaxRelativeGDDincrease * self.kiosk.WaterStressFactor
        self.rates.rGDD = max(0, drv.TEMP - self.params.BaseTemperature) * relGDDinc

    # 积分更新方法
    def integrate(self, day, delt):
        self.states.GDD += self.rates.rGDD * delt
        if self.states.GDD >= self.params.GDDatMaturity:
            self.states.DayofMaturity = day
            # 当成熟时发送信号
            self._send_signal(day=day, signal=signals.crop_finish, crop_delete=True)

        # 将计算结果存储到数据库中
        conn = sqlite3.connect('farm.db')
        cursor = conn.cursor()
        
        # 插入计算结果
        cursor.execute('''
        INSERT INTO crop_models (crop_variety, planting_area, gdd, maturity_date)
        VALUES (?, ?, ?, ?)
        ''', (self.params.CropVariety, self.params.PlantingArea, self.states.GDD, self.states.DayofMaturity))
        
        conn.commit()
        conn.close()

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
        self._critical_level = (self.params.FieldCapacity + self.params.WiltingPoint)/2.0
        SM = self.params.SeasonalSoilMoisture(doy(day))
        self.states = self.StateVariables(kiosk, SoilMoisture=SM, WaterStressFactor=0.0, publish=["WaterStressFactor"])

    # 计算速率方法
    def calc_rates(self, day, drv):
        pass

    # 积分更新方法
    def integrate(self, day, delt):
        self.states.SoilMoisture = self.params.SeasonalSoilMoisture(doy(day))
        WSF = (self._critical_level - self.states.SoilMoisture)/(self._critical_level - self.params.WiltingPoint)
        self.states.WaterStressFactor = limit(0.0, 1.0, WSF)
