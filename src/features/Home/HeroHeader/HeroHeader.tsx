import React from 'react';
import { Button, Text } from '@deriv/ui';
import styles from './HeroHeader.module.scss';

export const HeroHeader = () => {
  return (
    <header className={styles.HeroImageStyle} data-testid='hero-header'>
      <div className={styles.HeroContainerStyle}>
        <Text type='heading-1' as={'h1'} bold className={styles.heading} aria-level={2}>
          Deriv API
        </Text>
        <Text
          type='subtitle-1'
          align='center'
          as={'p'}
          aria-level={7}
          className={styles.SubHeading}
          data-testid='hero-header-subtitle'
        >
          Use our powerful, flexible, and free API to build a custom trading <br />
          platform - for yourself or for your business.
        </Text>
        <a href='/docs/intro'>
          <Button type='button' className={styles.HeroButton}>
            Read the docs
          </Button>
        </a>
      </div>
    </header>
  );
};
