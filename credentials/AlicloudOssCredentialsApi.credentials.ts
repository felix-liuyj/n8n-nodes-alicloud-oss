import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AlicloudOssCredentialsApi implements ICredentialType {
	name = 'alicloudOssApi';
	displayName = 'Alicloud OSS API';
	documentationUrl = 'https://www.alibabacloud.com/help/oss';

	properties: INodeProperties[] = [
		{
			displayName: 'AccessKey ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			required: true,
			description: 'Alibaba Cloud AccessKey ID for OSS authentication',
		},
		{
			displayName: 'AccessKey Secret',
			name: 'accessKeySecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Alibaba Cloud AccessKey Secret for OSS authentication',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'string',
			default: 'oss-cn-hongkong',
			required: true,
			placeholder: 'oss-cn-hongkong',
			description: 'OSS region endpoint (e.g., oss-cn-hongkong, oss-cn-beijing)',
		},
		{
			displayName: 'Bucket Name',
			name: 'bucket',
			type: 'string',
			default: '',
			required: true,
			description: 'Name of the OSS bucket to operate on',
		},
		{
			displayName: 'Custom Endpoint',
			name: 'endpoint',
			type: 'string',
			default: '',
			description: 'Optional custom OSS endpoint URL (overrides region-based endpoint)',
		},
	];
}
