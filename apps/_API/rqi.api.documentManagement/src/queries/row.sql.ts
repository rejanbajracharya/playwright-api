const GET_PACKAGE_GENERATION_LOG = `SELECT TOP 10 * FROM docs.PackageGenerationLog WHERE PackageGenerationLogId = @pglid ORDER BY 1 DESC;`;
const AWS_SQS_LOG = `SELECT TOP 10 * FROM RQIAPI..AWSsqsLog WHERE JSON_VALUE(Message, '$.Request.ConfirmationID') = @pglid ORDER BY 1 DESC;`;
const ROW_NOTIFICATION = `SELECT * FROM RQIAPI.dbo.RabbitMQLog WHERE QueueName = 'Request.Letter.Notification.ROW' AND  ISJSON(Message) = 1 AND JSON_VALUE(Message, '$.Request.ConfirmationID') IS NOT NULL AND JSON_VALUE(Message, '$.Request.ConfirmationID') = @pglid ORDER BY 1 DESC;`;

export { GET_PACKAGE_GENERATION_LOG, AWS_SQS_LOG, ROW_NOTIFICATION };