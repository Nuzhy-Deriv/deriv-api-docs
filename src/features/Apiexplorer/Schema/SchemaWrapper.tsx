import React from 'react';
import SchemaHeader from './SchemaHeader';
import SchemaBody from './SchemaBody';
import { TInfo } from '@site/src/types';

type TSchemaWrapper = {
  info: TInfo;
};

const SchemaWrapper = ({ info }: TSchemaWrapper) => {
  const { title, description, auth_required, auth_scopes } = info;

  return Object.entries(info).length !== 0 ? (
    <React.Fragment>
      <SchemaHeader
        title={title}
        description={description}
        auth_required={auth_required}
        auth_scopes={auth_scopes}
      />
      <SchemaBody jsonSchema={info} />
    </React.Fragment>
  ) : null;
};

export default SchemaWrapper;
