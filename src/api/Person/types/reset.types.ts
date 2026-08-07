export interface IResetFormValues {
    name: string;
    workNumber: string;
    newUsername: string;
    newPassword: string;
    confirmPassword: string;
}

export enum ResetStatus {
    NOT_FOUND = "该用户不存在",
    SUCCESS = "重置成功",
}