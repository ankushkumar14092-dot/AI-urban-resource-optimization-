# AI Urban Resource Optimization

The repository is a modular urban intelligence project that combines time-series forecasting, anomaly detection, and operational decision logic to support city-scale resource optimization.

The project is designed for developers and data scientists who want to build a practical AI system around live mobility, weather, and energy data. It is structured as a research-to-deployment pipeline where each notebook represents a clear stage in the product stack.

## Project goal

The system helps urban stakeholders answer questions like:

- How much traffic will be seen on a corridor in the next hour?
- Are there abnormal energy usage patterns that require intervention?
- What is the expected weather condition or temperature trend for the next hour?
- Which operational action should the city or campus system trigger next?

The final outcome is a decision engine that uses model outputs and operational context to recommend actions such as route guidance, signal timing changes, or maintenance alerts.

## High-level architecture

The project follows a layered architecture:

1. Data ingestion and preprocessing
2. Forecasting pipelines for traffic, energy, and weather
3. Anomaly detection for unusual energy behavior
4. Decision logic for operational recommendations
5. Backend integration for serving predictions and actions

This can map to a real full-stack application as:

- Frontend: dashboard or admin console
- Backend/API: FastAPI or Flask service
- Model layer: trained notebooks and serialized model artifacts
- Data layer: CSV files, operational records, and database tables
- Monitoring: predictions, incidents, and alert history

## Folder structure

```text
AI_Urban_Resource_Optimization/
├── README.md
├── data/
│   ├── traffic/
│   │   └── Metro_Interstate_Traffic_Volume.csv
│   ├── energy/
│   │   ├── energydata_complete.csv
│   │   ├── household_power_consumption.txt
│   │   └── household_power_consumption.zip
│   └── weather/
├── notebooks/
│   ├── 01_traffic_forecasting.ipynb
│   ├── 02_energy_forecasting.ipynb
│   ├── 03_energy_anomaly_detection.ipynb
│   ├── 05_decision_engine.ipynb
│   ├── 06_weather_forecasting.ipynb
├── models/
│   ├── traffic_forecasting_model.pkl
│   ├── traffic_features.pkl
│   ├── traffic_encoders.pkl
│   ├── energy_forecasting_model.pkl
│   ├── energy_features.pkl
│   ├── anomaly_detector.pkl
│   └── other visualization/model artifacts
├── outputs/
│   ├── traffic_eda.png
│   ├── traffic_predictions.png
│   ├── energy_predictions.png
│   ├── anomaly_detection.png
│   └── feature visualizations
└── .venv / project environment
```

## Notebook workflow

### 1. Traffic forecasting
File: notebooks/01_traffic_forecasting.ipynb

This notebook loads the Metro Interstate Traffic Volume dataset, performs feature engineering, builds lags and rolling averages, trains regression models, and saves a traffic forecast model.

Key outputs:
- predicted traffic volume
- feature importance charts
- saved model artifact and feature list

### 2. Energy forecasting
File: notebooks/02_energy_forecasting.ipynb

This notebook forecasts appliance or building energy usage based on time, weather, and usage history. It extracts lag features and compares model performance using a regressor such as XGBoost and Random Forest.

### 3. Energy anomaly detection
File: notebooks/03_energy_anomaly_detection.ipynb

This notebook identifies abnormal patterns in household or building energy consumption using unsupervised anomaly detection. It flags unusual spikes and saves an anomaly model for downstream use in the decision engine.

### 4. Weather forecasting
File: notebooks/06_weather_forecasting.ipynb

This notebook uses the weather columns already present in the traffic dataset to train a short-horizon temperature forecasting model. It creates lag, rolling, and time features and saves a weather model artifact for operational use.

### 5. Decision engine
File: notebooks/05_decision_engine.ipynb

This notebook combines model outputs into a rule-based logic engine. It merges traffic forecast load, energy anomaly status, and weather signals into a recommended action set.

## Project status and handoff for other developers

This repository is in a usable research-to-prototype state. The current active workflows are:

- Traffic forecasting using the Metro Interstate traffic dataset
- Energy forecasting and anomaly detection using energy usage signals
- Weather forecasting using weather-related columns from the traffic dataset
- Decision logic that combines the model outputs into a final recommendation

Important notes for contributors:

- The project currently does not include a standalone weather CSV in the data/weather folder.
- The weather model therefore uses weather columns already available in traffic data as the source of training signals.
- The project scope has been intentionally limited to the three core model families: traffic, energy, and weather.
- BDD or vision-related work is not part of the active production scope unless a dedicated dataset and model pipeline are added later.

### What a new developer should do first

1. Open the notebooks in order and confirm the training pipeline runs under the project venv.
2. Verify all required data files exist under the project data folders.
3. Load the saved model artifacts from the models/ directory before connecting any backend API.
4. Reuse the feature names and JSON schemas shown below when building the API layer.
5. Keep all retraining outputs consistent with the model names used in the backend.

## Data model and backend connection

The project has a clear data flow between model output and backend services.

### Data entities

The system is organized around a few operational entities:

- TrafficRecord
  - timestamp
  - road segment or corridor id
  - traffic volume
  - weather conditions
  - time-of-day and day-of-week indicators
  - lag and rolling features

- EnergyRecord
  - timestamp
  - active power consumption
  - weather/temperature attributes
  - lag features
  - anomaly flag

- WeatherForecastRecord
  - timestamp
  - temperature
  - rain/snow/cloud indicators
  - forecasted next hour value
  - prediction confidence

- ActionRecommendation
  - timestamp
  - route or corridor id
  - recommended action type
  - urgency level
  - reasons for action
  - confidence score


### Data model mapping to backend

A backend service can expose these as API resources:

- POST /traffic/predict
  - accepts the current traffic and weather features
  - returns predicted_volume and confidence

- POST /energy/predict
  - accepts the current energy features
  - returns predicted_energy and anomaly_state

- POST /decision/recommend
  - aggregates all predictions and returns action suggestions

This means notebook outputs should be saved in a stable format so the backend reads a machine-friendly schema.

For example:

```json
{
  "timestamp": "2026-10-03T08:00:00Z",
  "segment_id": "A12",
  "predicted_volume": 4200,
  "confidence": 0.87,
  "model": "traffic_forecasting_model",
  "status": "normal"
}
```

and a decision payload may look like:

```json
{
  "timestamp": "2026-10-03T08:00:00Z",
  "segment_id": "A12",
  "recommended_actions": [
    "Activate alternate route guidance",
    "Extend green signal phase on main corridor"
  ],
  "urgency": "HIGH",
  "reasons": [
    "Traffic at 85% of road capacity",
    "Heavy rain detected"
  ]
}
```

### Suggested backend architecture

A practical full-stack implementation would look like this:

- API layer: FastAPI or Flask
- Database: PostgreSQL or MongoDB
- Real-time queue: Redis or Kafka for event-driven operations
- Model service: Python microservice that loads the serialized .pkl models
- Frontend: Next.js, React, or Streamlit dashboard

Suggested backend responsibilities:

- validate incoming data
- transform raw sensor inputs into the feature schema the models expect
- call model inference using pickled artifacts from the models folder
- persist predictions and actions to a database
- expose REST endpoints for frontend or mobile clients

### Exact JSON request format for the server

Yes — the server will receive input in JSON format. The API should expect a JSON body like this for traffic prediction:

```json
{
  "timestamp": "2026-10-03T08:00:00Z",
  "segment_id": "A12",
  "hour": 8,
  "day_of_week": 1,
  "month": 10,
  "weekend": 0,
  "holiday_enc": 0,
  "temp": 24.8,
  "rain_1h": 1.5,
  "snow_1h": 0,
  "clouds_all": 30,
  "weather_main_enc": 3,
  "weather_desc_enc": 7,
  "traffic_lag_1": 3400,
  "traffic_lag_2": 3300,
  "traffic_lag_3": 3250,
  "traffic_lag_6": 3160,
  "traffic_lag_12": 3080,
  "traffic_lag_24": 3010,
  "rolling_mean_3": 3320,
  "rolling_mean_6": 3245,
  "rolling_mean_12": 3120,
  "rolling_std_6": 90
}
```

For energy prediction, the server may receive:

```json
{
  "timestamp": "2026-10-03T08:00:00Z",
  "hour": 18,
  "day_of_week": 4,
  "month": 10,
  "weekend": 0,
  "T1": 21.4,
  "RH_1": 54,
  "T2": 20.9,
  "RH_2": 56,
  "T_out": 18.1,
  "RH_out": 67,
  "Press_mm_hg": 1013,
  "Windspeed": 5.2,
  "Visibility": 55,
  "Tdewpoint": 11.9,
  "app_lag_1": 420,
  "app_lag_2": 410,
  "app_lag_3": 405,
  "app_lag_6": 398,
  "app_roll_mean_6": 412,
  "app_roll_std_6": 14
}
```

For decision requests, the server can accept a combined payload like:

```json
{
  "timestamp": "2026-10-03T08:00:00Z",
  "segment_id": "A12",
  "predicted_volume": 4200,
  "road_capacity": 6000,
  "predicted_energy_wh": 760,
  "energy_anomaly": false,
  "weather": {
    "rain_mm": 8,
    "temperature_c": 24.7
  }
}
```

A typical server response should be JSON like:

```json
{
  "status": "success",
  "model": "traffic_forecasting_model",
  "predicted_volume": 4200,
  "confidence": 0.87,
  "recommendation": {
    "actions": [
      "Extend green signal phase on main corridor"
    ],
    "urgency": "NORMAL",
    "reasons": [
      "Traffic is near moderate congestion threshold"
    ]
  }
}
```

This is the standard input/output contract the backend should use. In other words: the server will receive JSON, validate fields, pass them through the model, and return JSON results.

## Full-stack project pattern for other developers

This project is intentionally organized to make it easy to extend into a real production application.

### Recommended developer split

- Data scientists
  - improve feature engineering in notebooks
  - retrain models and validate metrics
  - save new model artifacts to the models folder

- Backend developers
  - build API endpoints around the model schemas
  - store predictions and alerts in a database
  - connect to dashboards and operational systems

- Frontend developers
  - display traffic conditions, predictions, and action cards
  - show anomaly alerts and operator status summaries

- DevOps / platform engineers
  - manage deployment, environments, monitoring, and versioning
  - containerize the API and dashboard

### Suggested next implementation steps

1. Create a backend service folder called api/
2. Add a schema folder for request/response models
3. Add a services folder for model loading and inference
4. Create a database layer for prediction logs and action history
5. Add a dashboard frontend to visualize key KPIs
6. Add tests for API contracts and model inference outputs
7. Add observability and retraining tracking
8. Add a model registry that stores training date, data source, and metric version

## Setup instructions

### Environment

Use the project virtual environment before running notebooks:

```bash
cd /Users/ankushkumarguptapahleja/Downloads/hack
source venv/bin/activate
```

### Package installation

If needed, install requirements:

```bash
pip install -r requirements.txt
```

### Notebook execution

Run notebooks in order:

1. 01_traffic_forecasting.ipynb
2. 02_energy_forecasting.ipynb
3. 03_energy_anomaly_detection.ipynb
4. 06_weather_forecasting.ipynb
5. 05_decision_engine.ipynb

This is the active notebook sequence for the current project scope.

### Saving new models

When retraining a model, keep the artifact naming consistent:

- traffic_forecasting_model.pkl
- traffic_features.pkl
- traffic_encoders.pkl
- energy_forecasting_model.pkl
- energy_features.pkl
- anomaly_detector.pkl
- weather_forecasting_model.pkl
- weather_features.pkl
- weather_training_metadata.pkl

This makes the backend integration predictable and easier to maintain.

## Best practices

- Keep notebooks reproducible and version-controlled.
- Save model metadata alongside serialized model artifacts.
- Use stable feature names across training and inference.
- Validate schema compatibility between notebook outputs and API models.
- Keep model training code separate from deployment logic.
- Log all predictions with timestamps and metadata.
- Monitor model drift and performance over time.
- Always store the exact training dataset path in the project data folder and record the date window used for training.

## Recommended next milestone

The project is ready for the next phase:

- build a FastAPI or Flask backend service
- expose /traffic/predict, /energy/predict, /weather/predict, and /decision/recommend endpoints
- persist model outputs to a database or log store
- create a lightweight dashboard to show predicted volume, anomaly alerts, and weather risk
- add automated tests for API inputs, outputs, and schema validation

This allows the notebook models to become real operational services rather than isolated experiments.

## Developer note

This project can evolve into a broad urban operations platform, including:

- traffic signal optimization
- building energy control
- district-level anomaly monitoring
- city operations dashboards
- route recommendation systems
- real-time incident triage

The current repository is the analytical foundation. The next step is to connect these notebook pipelines to a backend API and dashboard so that predictions are operationally usable by teams and systems.

## Summary

The project is not just a collection of notebooks. It is a modular AI system for urban resource optimization that can be connected to real services, data pipelines, and operational dashboards.

The key design principle is simple:

- notebooks build and validate the intelligence
- models define the decision logic
- backend services expose these capabilities to other systems
- frontend dashboards make the outcomes actionable for operators and developers
