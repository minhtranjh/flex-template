import React from 'react';
import { required } from '../../util/validators';
import { FieldSelect } from '../../components';

import css from './EditListingDescriptionForm.module.css';

const CustomCategorySelectFieldMaybe = props => {
  const { name, id, categories,label,placeholder,required } = props;
  return categories ? (
    <FieldSelect
      className={css.category}
      name={name}
      id={id}
      label={label}
      validate={required}
    >
      <option disabled value="">
        {placeholder}
      </option>
      {categories.map(c => (
        <option key={c.key} value={c.key}>
          {c.label}
        </option>
      ))}
    </FieldSelect>
  ) : null;
};

export default CustomCategorySelectFieldMaybe;
