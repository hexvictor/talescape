export type PublicUserInfo = {
	id: string;
	username: string;
	fullName: string;
	firstName: string;
	lastName: string;
	imageUrl: string | null;
};

export type AddUserEmailsProps = {
	id: string;
	userId: string;
	email: string;
}[];

export type AddUserProps = {
	id: string;
	username: string;
	imageUrl: string | null;
	firstName: string;
	lastName: string;
	fullName: string;
	primaryEmailId: string;
	emailVerifiedAt: Date;
};
