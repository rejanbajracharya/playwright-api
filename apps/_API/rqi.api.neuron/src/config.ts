import {
	defaultServiceConfigProvider,
} from "@repo/common-utility/service-config";

const RQIAPI_APP_NAME = "apps/rqi.api.neuron";

const getRqiApiServiceConfig = () => defaultServiceConfigProvider.getServiceConfig(RQIAPI_APP_NAME);

const hasRqiApiServiceConfig = () =>defaultServiceConfigProvider.hasServiceConfig(RQIAPI_APP_NAME);

export {
	getRqiApiServiceConfig,
	hasRqiApiServiceConfig,
	RQIAPI_APP_NAME,
};