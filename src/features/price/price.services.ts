import BigNumber from 'bignumber.js';
import config from '@/configuration';
import { getRequest, gqlRequest } from '@/helpers/requests';
import {
	FETCH_MAINNET_TOKEN_PRICE,
	FETCH_GNOSIS_TOKEN_PRICE,
} from './price.queries';

export const fetchEthPrice = async (): Promise<string> => {
	const res = await getRequest(
		'https://feathers.giveth.io/conversionRates?from=ETH&to=USD&interval=hourly',
	);
	return res.rate;
};

export const fetchMainnetTokenPrice = async (
	tokenId: string,
): Promise<string> => {
	const query = FETCH_MAINNET_TOKEN_PRICE;
	const variables = {
		tokenId: tokenId.toLowerCase(),
		daiId: '0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase(),
	};
	const { data } = await gqlRequest(
		config.MAINNET_CONFIG.uniswapV2Subgraph,
		false,
		query,
		variables,
	);
	const givEth = new BigNumber(data.givtoken.derivedETH);
	const daiEth = new BigNumber(data.daitoken.derivedETH);
	return givEth.div(daiEth).toString();
};

export const fetchGnosisTokenPrice = async (
	tokenId: string,
): Promise<string> => {
	const query = FETCH_GNOSIS_TOKEN_PRICE;
	const variables = {
		id: tokenId.toLowerCase(),
	};
	const { data } = await gqlRequest(
		config.XDAI_CONFIG.uniswapV2Subgraph,
		false,
		query,
		variables,
	);
	console.log('data', data);
	return '10';
};
