type ErrorResponse = {
  errors: ApplicationError[]
}

type ApplicationError = {
  errorMessage: string
  errorCode: string
}