/*
 * n8n 自定义节点：Alicloud OSS Control Node（基于 ali-oss SDK, Sm2Crypto 风格）
 * =====================================================================
 * 依赖说明
 * ---------------------------------------------------------------------
 * - 依赖官方 SDK `ali-oss`。
 * - 若使用官方 n8n Docker 镜像，请自定义构建并 `npm i ali-oss`。
 * ---------------------------------------------------------------------
 * 支持操作
 *   • 上传文件 (upload)
 *   • 下载文件 (download)
 *   • 列出对象   (list)
 *   • 删除文件   (delete)
 * ---------------------------------------------------------------------
 * 作者：Felix Liu (Cambria Tech) — 2025‑08‑05
 */

/* -------------------------------------------------------------------
 * 依赖导入
 * ---------------------------------------------------------------- */
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { Buffer } from 'buffer';
import OSS from 'ali-oss';

/* -------------------------------------------------------------------
 * 节点实现
 * ---------------------------------------------------------------- */
export class AlicloudOss implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Alicloud OSS',
		name: 'alicloudOss',
		icon: 'file:./alicloud-oss.logo.svg',
		group: ['transform'],
		version: 1,
		description: 'Operate Alibaba Cloud OSS within n8n workflows (ali-oss SDK)',
		defaults: {
			name: 'Alicloud OSS',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'alicloudOssApi',
				required: true,
			},
		],
		properties: [
			/* ------------------------------ 通用 ------------------------------ */
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Upload', value: 'upload' },
					{ name: 'Download', value: 'download' },
					{ name: 'List Objects', value: 'list' },
					{ name: 'Delete', value: 'delete' },
				],
				default: 'upload',
				noDataExpression: true,
			},
			{
				displayName: 'Object Key',
				name: 'objectKey',
				type: 'string',
				description: 'Full path of the OSS object, e.g. folder/file.txt',
				default: '',
				displayOptions: {
					show: {
						operation: ['upload', 'download', 'delete'],
					},
				},
				required: true,
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				description: 'Binary property name for upload / download',
				default: 'data',
				displayOptions: {
					show: {
						operation: ['upload', 'download'],
					},
				},
				required: true,
			},
			{
				displayName: 'Prefix',
				name: 'prefix',
				type: 'string',
				description: 'Prefix filter when listing objects',
				default: '',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
		],
	};

	/* ------------------------------ 执行入口 ------------------------------ */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = (await this.getCredentials('alicloudOssApi')) as {
			accessKeyId: string;
			accessKeySecret: string;
			region: string;
			bucket: string;
			endpoint?: string;
		};

		const client = new OSS({
			region: credentials.region,
			accessKeyId: credentials.accessKeyId,
			accessKeySecret: credentials.accessKeySecret,
			bucket: credentials.bucket,
			endpoint: credentials.endpoint || undefined,
		});

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				/* --------------------------- Upload --------------------------- */
				if (operation === 'upload') {
					const objectKey = this.getNodeParameter('objectKey', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);

					const putRes = await client.put(objectKey, Buffer.from(binaryData.data));
					returnData.push({ json: { success: true, url: putRes.url, objectKey } });
				} else if (operation === 'download') {
					/* --------------------------- Download --------------------------- */
					const objectKey = this.getNodeParameter('objectKey', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

					const getRes = await client.get(objectKey);
					returnData.push({
						json: { objectKey },
						binary: {
							[binaryPropertyName]: await this.helpers.prepareBinaryData(
								getRes.content as Buffer,
								objectKey,
							),
						},
					});
				} else if (operation === 'list') {
					/* --------------------------- List --------------------------- */
					const prefix = this.getNodeParameter('prefix', i, '') as string;
					const listRes = await client.list(
						{
							prefix,
							'max-keys': 1000, // 默认为 1000，可自定义
						},
						{},
					);
					const objects = listRes.objects ?? [];
					for (const obj of objects) {
						returnData.push({ json: obj as unknown as Record<string, any> });
					}
				} else if (operation === 'delete') {
					/* --------------------------- Delete --------------------------- */
					const objectKey = this.getNodeParameter('objectKey', i) as string;
					await client.delete(objectKey);
					returnData.push({ json: { success: true, objectKey } });
				}
			} catch (error) {
				const errMsg = (error as Error).message;
				if (this.continueOnFail()) {
					returnData.push({ json: { error: errMsg } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
