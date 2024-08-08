# Project Description

## Overview

This project consists of two separate applications:

1. **Rule Engine with AST**
2. **Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates**

### Application 1: Rule Engine with AST

**Key Features:**
- Define a data structure to represent the AST.
- Store rules and application metadata in a MongoDB database.
- API endpoints to create rules, combine rules, and evaluate rules against user data.
- Error handling for invalid rule strings or data formats.
- Validation for attributes to be part of a catalog.
- Modification of existing rules.

**Endpoints:**
- `POST /create_rule`: Creates a rule from a string representation and stores it as an AST.
- `POST /combine_rules`: Combines multiple rules into a single AST.
- `POST /evaluate_rule`: Evaluates a combined rule against provided user data.
- `GET /latest_ast`: Retrieve latest ast from database for evaluation

**Example Rules:**
- rule1: `"((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)"`
- rule2: `"((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)"`

### Application 2: Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates


**Key Features:**
- Retrieve weather data from OpenWeatherMap API at configurable intervals. ---> corn
- Convert temperature values from Kelvin to Celsius. ---> function
- Store daily weather summaries in a MongoDB database. ---> schema why do i store like that
- Define user-configurable thresholds for alerting. ---> increase the configurable parameters
- Implement visualizations to display daily summaries and alerts. ---> graph and logs

**Endpoints:**
- `GET /weather`: Fetches real-time weather data and processes it.
- `GET /summaries`: Retrieves daily weather summaries.
- `GET /alerts`: Retrieves active weather alerts.
- `POST /Update-alertPreference`: Updates the preference of getting alerts.

**Data Aggregation:**
- Daily weather summary includes average, maximum, and minimum temperatures and dominant weather conditions.
- Alerting thresholds trigger notifications if conditions exceed user-defined limits.

## Setup Instructions

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/KrishnaSaiChaitanya/Zeotap_Assignment.git
    cd Zeotap_Assignment
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

### Running the Applications

1. Start the Rule Engine application:
    ```sh
    node ruleEngine.js
    ```

2. Start the Weather Monitoring application:
    ```sh
    node weatherMonitoring.js
    ```

### Testing

1. Run the tests for Rule Engine:
    ```sh
    npm run test:ruleEngine
    ```

2. Run the tests for Weather Monitoring:
    ```sh
    npm run test:weatherMonitoring
    ```

## Usage

### Rule Engine

- Use the provided endpoints to create, combine, and evaluate rules.

### Weather Monitoring

- Fetch real-time weather data and view daily summaries and alerts using the provided endpoints.

## Design Choices

- **Rule Engine:**
    - Used AST for flexible and dynamic rule representation.
    - Chose MongoDB for its schema-less nature, allowing easy storage of diverse rule structures.

- **Weather Monitoring:**
    - Utilized OpenWeatherMap API for reliable weather data.
    - MongoDB for storing rollups and aggregates due to its flexibility and scalability.

## Dependencies

- Node.js
- MongoDB
- Axios (for API requests)
- Express (for creating the API)
- Mongoose (for MongoDB interaction)
- Jest (for testing)

## Conclusion

This project demonstrates the implementation of a rule engine using AST and a real-time weather monitoring system. It covers data retrieval, processing, storage, and visualization, providing a comprehensive solution for both use cases.
