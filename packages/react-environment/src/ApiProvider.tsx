import React, { ReactNode, FC, useState, useEffect, useContext } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@acala-network/api/build';

const CONNECT_TIMEOUT = 1000 * 60; // one minute

interface ApiProps {
  endpoint: string;
  children: ReactNode;
  Loading?: ReactNode;
  ConnectError?: ReactNode;
}

interface ConnectStatus {
  connected: boolean;
  error: boolean;
  loading: boolean;
}

export interface ApiData {
  api: ApiPromise;
  connected: boolean;
  error: boolean;
  loading: boolean;
}

export const ApiContext = React.createContext<ApiData>(
  {} as ApiData
);

/**
 * @name Api
 * @description connect chain in the Api Higher-Order Component.
 * @example
 * ```js
 *  <Api endpoint={ENDPOINT} >
 *      {...something}
 *  </Api>
 * ```
 */
export const ApiProvider: FC<ApiProps> = ({
  endpoint,
  children,
  ConnectError,
  Loading
}) => {
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>(
    {} as ConnectStatus
  );
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise);

  const renderContent = (): ReactNode => {
    if (connectStatus.loading && Loading) {
      return Loading;
    }

    if (connectStatus.connected) {
      return children;
    }

    return null;
  };

  const renderError = (): ReactNode => {
    if (connectStatus.error && ConnectError) {
      return ConnectError;
    }

    return null;
  };

  useEffect(() => {
    if (!endpoint) {
      return;
    }

    // reset connect status
    setConnectStatus({ connected: false, error: false, loading: true });
    // content endpoint
    const provider = new WsProvider(endpoint);
    const timeout = (time: number): Promise<void> =>
      new Promise((resolve, reject) => setTimeout(() => { reject(new Error('timeout')); }, time));

    Promise.race([
      ApiPromise.create(options({ provider })),
      timeout(CONNECT_TIMEOUT)
    ])
      .then((api: any) => {
        console.log(api);
        setApi(api as ApiPromise);
        setConnectStatus({ connected: true, error: false, loading: false });
      })
      .catch(() => {
        setConnectStatus({ connected: false, error: true, loading: false });
      });
  }, [endpoint]);

  useEffect(() => {
    if (!connectStatus.connected) return;
    api.on('disconnected', () => {
      setConnectStatus({ connected: false, error: true, loading: false });
    });
    api.on('error', () => {
      setConnectStatus({ connected: false, error: true, loading: false });
    });

    return (): void => api.disconnect();
  }, [api, connectStatus]);

  return (
    <ApiContext.Provider
      value={{
        api,
        ...connectStatus
      }}
    >
      {Loading ? renderContent() : children}
      {renderError()}
    </ApiContext.Provider>
  );
};
