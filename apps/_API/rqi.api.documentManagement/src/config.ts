import {
	defaultServiceConfigProvider,
} from "@repo/common-utility/service-config";

const RQIAPI_APP_NAME = "apps/rqi.api.documentManagement";

const getRqiApiServiceConfig = () => defaultServiceConfigProvider.getServiceConfig(RQIAPI_APP_NAME);
const getAircomServiceConfig = () => defaultServiceConfigProvider.getAircomServiceConfig();

const hasRqiApiServiceConfig = () =>defaultServiceConfigProvider.hasServiceConfig(RQIAPI_APP_NAME);

export {
	getRqiApiServiceConfig,
	getAircomServiceConfig,
	hasRqiApiServiceConfig,
	RQIAPI_APP_NAME,
};