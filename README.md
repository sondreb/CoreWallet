| Windows | Mac OS | Linux
| :---- | :------ | :---- |
| [![Build Status](https://dev.azure.com/SolarisPlatform/SolarisCore/_apis/build/status/Hosted%20Windows%20Container)](https://dev.azure.com/SolarisPlatform/SolarisCore/_build/latest?definitionId=16) | [![Build Status](https://dev.azure.com/SolarisPlatform/SolarisCore/_apis/build/status/Hosted%20macOS)](https://dev.azure.com/SolarisPlatform/SolarisCore/_build/latest?definitionId=18) | [![Build Status](https://dev.azure.com/SolarisPlatform/SolarisCore/_apis/build/status/Hosted%20Ubuntu%201604)](https://dev.azure.com/SolarisPlatform/SolarisCore/_build/latest?definitionId=17)

# City Core

This is the repository of the City Core Wallet, a full node staking wallet using Electron and Angular at the front-end and .NET Core with C# in the back-end.

# Building and running the City Chain daemon

The City Chain daemon is the backend REST service, hosting a City Chain node upon which City Core depends.  
The City Chain daemon is hosted in another repository. All information on building and running the daemon can be found [here](https://github.com/CityChainFoundation/city-chain/blob/master/Documentation/getting-started.md).

# Building and running the City Core user interface

## Install NodeJS

Download and install the latest Long Term Support (LTS) version of NodeJS at: https://nodejs.org/. 

## Getting Started

Clone this repository locally:

``` bash
git clone https://github.com/CityChainFoundation/CityCore
```

Navigate to the StratisCore.UI folder in a terminal:
``` bash
cd ./CityCore/StratisCore.UI
```

## Install dependencies with npm:

From within the StratisCore.UI directory run:

``` bash
npm install
```

## Run the UI in development mode

#### Terminal Window 1
[Run the daemon](https://github.com/CityChainFoundation/city-chain/blob/master/Documentation/getting-started.md)  

#### Terminal Window 2
Use `npm run mainnet` to start the UI in mainnet mode or `npm run testnet` to start the UI in testnet mode.  
This will compile the Angular code and spawn the Electron process.

## Build the UI for production

|Command|Description|
|--|--|
|`npm run build:prod`| Compiles the application for production. Output files can be found in the dist folder |
|`npm run package:linux`| Builds your application and creates an app consumable on linux system |
|`npm run package:linuxarm`| Builds your application and creates an app consumable on linux-arm system (i.e., Raspberry Pi) |
|`npm run package:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run package:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

**The application is optimised. Only the files of /dist folder are included in the executable. Distributable packages can be found in the StratisCore.UI/app-builds/ folder**

