import { registerRootComponent } from 'expo';

// Import order matters here and is load-bearing.
//
// `locationTask` calls `TaskManager.defineTask` at module scope. When iOS
// relaunches the app in the background for a geofence event, the system boots
// this bundle, immediately looks for the registered task, runs it headlessly,
// and tears the process down — no React component ever mounts. The task
// definitions must therefore already exist by the time this module finishes
// evaluating, which means importing them before the app component.
import './src/services/locationTask';

import App from './App';

registerRootComponent(App);
