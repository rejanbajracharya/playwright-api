import {
	defaultServiceConfigProvider,
} from "@repo/common-utility/service-config";

const RQIAPI_SERVICE_NAME = "RQI.API.NEURON";

const getRqiServiceConfig = () =>
	defaultServiceConfigProvider.getServiceConfig(RQIAPI_SERVICE_NAME);
const hasRqiServiceConfig = () =>
	defaultServiceConfigProvider.hasServiceConfig(RQIAPI_SERVICE_NAME);

export { getRqiServiceConfig, hasRqiServiceConfig, RQIAPI_SERVICE_NAME };