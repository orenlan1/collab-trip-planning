interface UserUpdateData {
    name?: string;
    image?: string;
}
declare const _default: {
    update: (user: Express.User, data: UserUpdateData) => Promise<Express.User | undefined>;
};
export default _default;
//# sourceMappingURL=user-service.d.ts.map