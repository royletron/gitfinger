export enum FingerErrorCode {
  ConfigNotFound,
  ConfigAlreadyExists,
  RepoAlreadyExists,
  RepoHasDifferentOrigin,
  RepoUnableToFindOrigin,
  OperationCancelled,
  RepoUnableToGetStatus
}

export default class FingerError extends Error {
  public code: FingerErrorCode
  constructor(code: FingerErrorCode, message?: string) {
    super(message)
    this.code = code;
  }
}