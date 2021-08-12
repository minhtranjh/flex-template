import React from 'react';
import { FormattedMessage } from 'react-intl/dist/react-intl';
import { array, shape, string } from 'prop-types';
import css from './ListingPage.module.css';
const SectionViewMaybe = (props) => {
    const {options , publicData } = props
    const selectedOption = publicData && publicData.view ? publicData.view : null
    if(!publicData || !selectedOption){
        return null;
    } 
    const optionsConfig = options.find(o=>o.key===selectedOption)
    const optionLabel = optionsConfig ? optionsConfig.label : null;
   return ( optionLabel ? 
        <div className={css.sectionFeatures}>
            <h2>
                <FormattedMessage
                    id="ListingPage.viewType"
                    values={{view : optionLabel.toLowerCase()}}
                />
            </h2>
        </div> : null
    ) 
};

SectionViewMaybe.defaultProps = { className: null, rootClassName: null };

SectionViewMaybe.propTypes = {
  className: string,
  rootClassName: string,
  publicData: shape({
    view: string,
  }),
};

export default SectionViewMaybe;