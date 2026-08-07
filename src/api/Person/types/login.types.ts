export interface ILoginFormValues {
    username: string;
    password: string;
}

export enum LoginStatus {
    NOT_FOUND = "该用户不存在",
    VERIFY_ERROR = "用户名或密码错误",
    SUCCESS = "登录成功",
}