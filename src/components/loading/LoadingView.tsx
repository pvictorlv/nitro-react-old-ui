import { FC, useMemo } from 'react';
import { Base, Column } from '../../common';

const generateRandomImageIndex = () => Math.floor(Math.random() * 30);

interface LoadingViewProps {
  isError?: boolean;
  message?: string;
  percent?: number;
}

export const LoadingView: FC<LoadingViewProps> = ({ isError = false, message = '', percent = 0 }) =>
{
  // const randomImageIndex = useMemo(generateRandomImageIndex, []);

  return (
    <Column fullHeight alignItems="center" justifyContent="center" className="nitro-loading">
      <Column className="text-center py-4 align-items-center">
        { isError && message ? (
          <Base className="fs-4 text-shadow">{ message }</Base>
        ) : (
          <>
            <div className="loadingPhoto" />
            <div className="nitro-loading-bar mt-2">
              <div className="nitro-loading-bar-inner" style={ { width: `${ percent }%` } } />
            </div>
          </>
        ) }
      </Column>
    </Column>
  );
};
