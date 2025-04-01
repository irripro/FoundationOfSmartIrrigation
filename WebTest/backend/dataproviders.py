import datetime as dt
import os
import warnings

import sqlalchemy as sa
from flask import request  # Import request for handling user input

import pcse
from pcse import settings
from pcse.db.pcse import fetch_cropdata, fetch_sitedata, fetch_soildata, GridWeatherDataProvider, \
AgroManagementDataProvider
from pcse.base import ParameterProvider

db_location = os.path.join(settings.PCSE_USER_HOME,"pcse.db")
db_location = os.path.normpath(db_location)
dsn = "sqlite:///" + db_location

db_engine = sa.create_engine(dsn)
db_metadata = sa.MetaData(db_engine)

def get_crop_data(grid, year, crop):
    """Fetch crop data based on user input."""
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        sited = fetch_sitedata(db_metadata, grid, year)
        cropd = fetch_cropdata(db_metadata, grid, year, crop)
        soild = fetch_soildata(db_metadata, grid)
        parameters = ParameterProvider(sitedata=sited, cropdata=cropd, soildata=soild)
    return parameters

# Example of how to use user input for fetching data
grid = request.args.get('grid', default=31031, type=int)  # Get grid from user input
crop = request.args.get('crop', default=1, type=int)      # Get crop from user input
year = request.args.get('year', default=2000, type=int)   # Get year from user input

parameters = get_crop_data(grid, year, crop)

# Get Agromanagement
agromanagement = AgroManagementDataProvider(db_engine, grid, crop, year)

start_date = list(agromanagement[0].keys())[0]
end_date = start_date + dt.timedelta(days=365)
weather = GridWeatherDataProvider(db_engine, grid_no=grid, start_date=start_date, end_date=end_date)
