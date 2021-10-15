import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Popover, Button } from 'antd';
import BigNumber from 'bignumber.js';
import { PageHeader } from 'ui/component';
import TokenAmountInput from 'ui/component/TokenAmountInput';
import TagChainSelector from 'ui/component/ChainSelector/tag';
import PriceSlippageSelector from 'ui/component/PriceSlippageSelector';
import Quoting from './components/Quoting';
import { useWallet } from 'ui/utils';
import { formatTokenAmount, splitNumberByStep } from 'ui/utils/number';
import { CHAINS_ENUM, CHAINS } from 'consts';
import { TokenItem } from 'background/service/openapi';
import { Account } from 'background/service/preference';
import IconSwapArrow from 'ui/assets/swap-arrow.svg';
import './style.less';

const Swap = () => {
  const dapps = [
    {
      logo:
        'https://static.debank.com/image/project/logo_url/bsc_pancakeswap/a4e035cf4495755fddd5ebb6e5657f63.png',
      name: 'PancakeSwap',
      id: 'bsc_1inch',
    },
    {
      logo:
        'https://static.debank.com/image/project/logo_url/bsc_1inch/a4fcc0d0e8daddd0313ad14172e11aff.png',
      name: '1inch',
      id: 'bsc_pancakeswap',
    },
  ];
  const { t } = useTranslation();
  const wallet = useWallet();
  const history = useHistory();
  const [chain, setChain] = useState(CHAINS_ENUM.BSC);
  const [fromUSDValue, setFromUSDValue] = useState('0');
  const [fromValue, setFromValue] = useState('0');
  const [from, setFrom] = useState<TokenItem>({
    id: 'bsc',
    chain: 'bsc',
    name: 'BNB',
    symbol: 'BNB',
    display_symbol: null,
    optimized_symbol: 'BNB',
    decimals: 18,
    logo_url:
      'https://static.debank.com/image/bsc_token/logo_url/bsc/8bfdeaa46fe9be8f5cd43a53b8d1eea1.png',
    price: 351.4,
    is_verified: true,
    is_core: true,
    is_wallet: true,
    time_at: 0,
    amount: 0,
  });
  const [to, setTo] = useState<TokenItem>({
    amount: 0,
    chain: 'bsc',
    decimals: 18,
    display_symbol: null,
    id: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    is_core: true,
    is_verified: true,
    is_wallet: true,
    logo_url:
      'https://static.debank.com/image/token/logo_url/0x4fabb145d64652a948d72533023f6e7a623c7c53/f0825e572298822e7689fe81150a195d.png',
    name: 'Binance USD',
    optimized_symbol: 'BUSD',
    price: 1,
    symbol: 'BUSD',
    time_at: 0,
  });
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [originTokens, setOriginTokens] = useState<TokenItem[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [priceSlippage, setPriceSlippage] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTokenChange = (token: TokenItem) => {
    setFrom(token);
  };

  const loadToken = async (
    token: TokenItem,
    address: string
  ): Promise<TokenItem> => {
    return await wallet.openapi.getToken(address, token.chain, token.id);
  };

  const init = async () => {
    const account = await wallet.syncGetCurrentAccount();
    const [fromToken, toToken] = await Promise.all([
      loadToken(from, account.address),
      loadToken(to, account.address),
    ]);

    setCurrentAccount(account);
    setFrom(fromToken);
    setTo(toToken);
  };

  const handleClickFromBalance = () => {
    const value = new BigNumber(from.amount).toFixed();
    setFromValue(value);
  };

  const handleChainChanged = (value: CHAINS_ENUM) => {
    setChain(value);
  };

  const handleToTokenChange = (token: TokenItem) => {
    setTo(token);
  };

  const handlePriceSlippageChange = (val: number) => {
    setPriceSlippage(val);
  };

  const loadQuotes = async () => {
    const pancakeRes = await axios.get('https://api.debank.com/swap/check', {
      params: {
        dex_id: dapps[0].id,
        pay_token_id: from.id,
        pay_token_amount: new BigNumber(fromValue).times(1e18).toFixed(),
        receive_token_id: to.id,
        user_addr: currentAccount?.address,
        max_slippage: priceSlippage / 100,
        chain: CHAINS[chain].serverId,
      },
    });
    setCurrentIndex(1);
    const inchRes = await axios.get('https://api.debank.com/swap/check', {
      params: {
        dex_id: dapps[1].id,
        pay_token_id: from.id,
        pay_token_amount: new BigNumber(fromValue).times(1e18).toFixed(),
        receive_token_id: to.id,
        user_addr: currentAccount?.address,
        max_slippage: priceSlippage / 100,
        chain: CHAINS[chain].serverId,
      },
    });
    console.log(inchRes);
    history.push({
      pathname: '/swap-confirm',
      state: {
        data: { dapp: dapps[0], data: pancakeRes.data.data },
        from,
        to,
        fromValue,
      },
    });
  };

  const handleGoPrevStep = () => {
    setCurrentStep(currentStep - 1);
    if (currentStep === 1) {
      setCurrentIndex(0);
    }
  };

  const handleGetQuote = () => {
    setCurrentStep(1);
    loadQuotes();
  };

  useEffect(() => {
    const target = CHAINS[chain];

    setFrom({
      id: target.serverId,
      chain: target.serverId,
      name: target.nativeTokenSymbol,
      symbol: target.nativeTokenSymbol,
      display_symbol: null,
      optimized_symbol: target.nativeTokenSymbol,
      decimals: 18,
      logo_url: target.nativeTokenLogo,
      price: 0,
      is_verified: true,
      is_core: true,
      is_wallet: true,
      time_at: 0,
      amount: 0,
    });
  }, [chain]);

  useEffect(() => {
    // TODO
  }, [fromValue]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="swap">
      <PageHeader>{t('Swap')}</PageHeader>
      <TagChainSelector value={chain} onChange={handleChainChanged} />
      <div className="swap-section">
        <div className="from-balance">
          <span className="cursor-pointer" onClick={handleClickFromBalance}>
            {t('Balance')}: {formatTokenAmount(from.amount, 8)}
          </span>
        </div>
        {currentAccount && (
          <TokenAmountInput
            address={currentAccount.address}
            token={from}
            value={fromValue}
            chainId={CHAINS[chain].serverId}
            onTokenChange={handleTokenChange}
            onChange={(v) => setFromValue(v)}
          />
        )}
        <div className="from-token">
          <span className="from-token__name">{from.name}</span>
          <span className="from-token__usdvalue">
            ≈ $
            {splitNumberByStep(
              new BigNumber(fromValue || 0)
                .times(new BigNumber(from.price || 0))
                .toFixed()
            )}
          </span>
        </div>
        <div className="swap-arrow">
          <img src={IconSwapArrow} className="icon icon-swap-arrow" />
        </div>
        {currentAccount && (
          <TokenAmountInput
            address={currentAccount.address}
            token={to}
            chainId={CHAINS[chain].serverId}
            onTokenChange={handleToTokenChange}
            readOnly
          />
        )}
        <div className="to-token">
          <span className="to-token__name">{to.name}</span>
        </div>
      </div>
      <div className="swap-section price-slippage-section">
        <p className="section-title">{t('Max price slippage')}</p>
        <PriceSlippageSelector
          value={priceSlippage}
          onChange={handlePriceSlippageChange}
        />
      </div>
      <div className="footer">
        <Button
          size="large"
          type="primary"
          className="w-[200px]"
          onClick={handleGetQuote}
        >
          {t('Get Quotes')}
        </Button>
      </div>
      {currentStep === 1 && (
        <Quoting
          dapps={dapps}
          currentIndex={currentIndex}
          onCancel={handleGoPrevStep}
        />
      )}
    </div>
  );
};

export default Swap;