export type MongooseErrorResponseBodyType = {
    errorsMessages: [{ message: string; field: string }];
};
