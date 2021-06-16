import React, { memo, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'clsx';
import { Button } from 'antd';

interface StrayFooterProps {
  className?: string;
  children: ReactNode;
}

export interface StrayFooterNavProps {
  onNextClick?(): void;
  onBackClick?(): void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  hasBack?: boolean;
  hasDivider?: boolean;
  className?: string;
  NextButtonContent?: React.ReactNode;
  BackButtonContent?: React.ReactNode;
}

interface CompoundedComponent
  extends React.MemoExoticComponent<React.FunctionComponent<StrayFooterProps>> {
  Nav: typeof StrayFooterNav;
}

const StrayFooter = memo(({ className, children }: StrayFooterProps) => {
  return (
    <div className={cx('absolute bottom-0 left-0 w-full flex', className)}>
      {children}
    </div>
  );
}) as CompoundedComponent;

const StrayFooterNav = memo(
  ({
    onNextClick,
    onBackClick,
    backDisabled,
    nextDisabled,
    hasBack = false,
    hasDivider = false,
    NextButtonContent = 'Next',
    BackButtonContent = 'Back',
    className,
  }: StrayFooterNavProps) => {
    const history = useHistory();

    const handleBack = async () => {
      if (onBackClick) {
        onBackClick();
        return;
      }

      history.goBack();
    };

    return (
      <StrayFooter className={className}>
        <div
          className={cx(
            'pt-24 pb-32 px-20 w-full flex justify-center',
            hasDivider && 'bg-white border-gray-divider border-t pt-24'
          )}
        >
          {hasBack && (
            <Button
              disabled={backDisabled}
              onClick={handleBack}
              size="large"
              className="flex-1 mr-16 lg:h-[52px]"
            >
              {BackButtonContent}
            </Button>
          )}
          <Button
            disabled={nextDisabled}
            htmlType="submit"
            onClick={onNextClick}
            size="large"
            className={cx('lg:h-[52px]', hasBack ? 'flex-1' : 'w-[200px]')}
            type="primary"
          >
            {NextButtonContent}
          </Button>
        </div>
      </StrayFooter>
    );
  }
);

StrayFooter.Nav = StrayFooterNav;

export default StrayFooter;
