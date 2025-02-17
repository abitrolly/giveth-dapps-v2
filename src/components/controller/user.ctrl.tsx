import { useWeb3React } from '@web3-react/core';
import { useEffect, useRef, useState } from 'react';
import { formatEther } from '@ethersproject/units';
import { captureException } from '@sentry/nextjs';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useAppDispatch } from '@/features/hooks';
import {
	setBalance,
	setIsLoading,
	setToken,
	setIsEnabled,
} from '@/features/user/user.slice';
import { isSSRMode } from '@/lib/helpers';
import StorageLabel from '@/lib/localStorage';
import { fetchUserByAddress, signOut } from '@/features/user/user.thunks';
import { walletsArray } from '@/lib/wallet/walletTypes';

const UserController = () => {
	const { account, library, chainId, activate } = useWeb3React();
	const dispatch = useAppDispatch();
	const [isActivatedCalled, setIsActivatedCalled] = useState(false);
	const token = !isSSRMode ? localStorage.getItem(StorageLabel.TOKEN) : null;

	const isMounted = useRef(false);

	useEffect(() => {
		const selectedWalletName = localStorage.getItem(StorageLabel.WALLET);
		const wallet = walletsArray.find(w => w.value === selectedWalletName);
		if (wallet && wallet.connector instanceof InjectedConnector) {
			wallet.connector
				.isAuthorized()
				.then(isAuthorized => {
					if (isAuthorized) {
						activate(wallet.connector, console.log)
							.then(() => setIsActivatedCalled(true))
							.finally(() => {
								if (!token) dispatch(setIsLoading(false));
							});
					} else {
						dispatch(setIsLoading(false));
					}
				})
				.catch(() => dispatch(setIsLoading(false)));
		} else {
			dispatch(setIsLoading(false));
		}
	}, [activate, isActivatedCalled]);

	useEffect(() => {
		if (isMounted.current) {
			if (!account) {
				// Case when wallet is locked
				dispatch(setIsEnabled(false));
			}
			// Sign out if wallet is changed
			dispatch(signOut());
		}
		if (account) {
			isMounted.current = true;
			dispatch(fetchUserByAddress(account));
			dispatch(setIsEnabled(true));
		}
	}, [account]);

	useEffect(() => {
		if (token) {
			dispatch(setToken(token));
		}
	}, [token]);

	useEffect(() => {
		if (account && library) {
			library?.on('block', () => {
				//Getting balance on every block
				if (account && library) {
					library
						.getBalance(account)
						.then((_balance: string) => {
							const balance = parseFloat(
								formatEther(_balance),
							).toFixed(3);
							dispatch(setBalance(balance));
						})
						.catch((error: unknown) => {
							dispatch(setBalance(null));
							captureException(error, {
								tags: {
									section: 'getBalance',
								},
							});
						});
				}
			});
		}
		return () => {
			library?.removeAllListeners('block');
		};
	}, [account, library, chainId]);

	return null;
};

export default UserController;
