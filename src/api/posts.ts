import { IApiEndpoint } from './_types.js';

export const endpoints: IApiEndpoint[] = [
	{
		path: '/posts',
		method: 'get',
		handler: getPosts,
	},
];

async function getPosts(_params: any): Promise<{ body: any; status: number }> {
	const posts = [
		{ id: 1, title: 'First 2Post', content: 'This is the first post.' },
		{ id: 2, title: 'Second Post', content: 'This is the second post.' },
	];
	return { body: posts, status: 200 };
}
