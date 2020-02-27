import React, { FC } from 'react';
import { withStyles } from '@material-ui/styles';
import { Theme, List } from '@material-ui/core';
import { ProductItem } from './product-item';
import WalletIcon from '@/assets/wallet.svg';
import { useSelector } from 'react-redux';
import { accountSelector } from '@/store/account/selectors';
import { formatAddress } from '@/utils';

const ProductList = withStyles((theme: Theme) => ({
    root: {
        margin: '0 0 37px 0',
    },
}))(List);

export const UserCenter: FC = () => {
    const address = useSelector(accountSelector);
    return (
        <ProductList>
            <ProductItem icon={WalletIcon} name={formatAddress(address)} path="wallet" />
        </ProductList>
    );
};
