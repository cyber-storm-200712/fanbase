import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MetaFoxLogo from '../../../ui/metafox-logo';
import PageContainerFooter from '../../../ui/page-container/page-container-footer';

export default class MetaMetricsOptInModal extends Component {
  static propTypes = {
    setParticipateInMetaMetrics: PropTypes.func,
    hideModal: PropTypes.func,
  };

  static contextTypes = {
    metricsEvent: PropTypes.func,
    t: PropTypes.func,
  };

  render() {
    const { metricsEvent, t } = this.context;
    const { setParticipateInMetaMetrics, hideModal } = this.props;

    return (
      <div className="metametrics-opt-in metametrics-opt-in-modal">
        <div className="metametrics-opt-in__main">
          <div className="metametrics-opt-in__content">
            <MetaFoxLogo />
            <div className="metametrics-opt-in__body-graphic">
              <img src="images/metrics-chart.svg" alt="" />
            </div>
            <div className="metametrics-opt-in__title">
              Fanbase needs your help.
            </div>
            <div className="metametrics-opt-in__body">
              <div className="metametrics-opt-in__description">
              FFanbase collects user data according to law and to improve the useability of the application. 
              </div>
              <div className="metametrics-opt-in__description">
              You can...
              </div>

              <div className="metametrics-opt-in__committments">
                <div className="metametrics-opt-in__row">
                  <i className="fa fa-check" />
                  <div className="metametrics-opt-in__row-description">
                  Opt-out via settings.
                  </div>
                </div>
                <div className="metametrics-opt-in__row">
                  <i className="fa fa-check" />
                  <div className="metametrics-opt-in__row-description">
                  View pages anonymously.
                  </div>
                </div>
                <div className="metametrics-opt-in__row">
                  <i className="fa fa-check" />
                  <div className="metametrics-opt-in__row-description">
                  Review our decentralized principles.
                  </div>
                </div>
                <div className="metametrics-opt-in__row">
                  <i className="fa fa-check" />
                  <div className="metametrics-opt-in__row-description">
                  Make suggestions on our BonJourno.com board.
                  </div>
                </div>
                <div className="metametrics-opt-in__row">
                  <i className="fa fa-check" />
                  <div className="metametrics-opt-in__row-description">
                  Engage with our chats regularly on BonJourno.com.
                  </div>
                </div>
              </div>
            </div>
            <div className="metametrics-opt-in__bottom-text">
              This data is aggregated and is therefore anonymous for the
              purposes of General Data Protection Regulation (EU) 2016/679. For
              more information in relation to our privacy practices, please see
              our&nbsp;
              <a
                href="https://www.fanbase.io/#/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy here
              </a>
              .
            </div>
          </div>
          <div className="metametrics-opt-in__footer">
            <PageContainerFooter
              onCancel={() => {
                setParticipateInMetaMetrics(false).then(() => {
                  metricsEvent(
                    {
                      eventOpts: {
                        category: 'Onboarding',
                        action: 'Metrics Option',
                        name: 'Metrics Opt Out',
                      },
                      isOptIn: true,
                    },
                    {
                      excludeMetaMetricsId: true,
                    },
                  );
                  hideModal();
                });
              }}
              cancelText={t('noThanks')}
              hideCancel={false}
              onSubmit={() => {
                setParticipateInMetaMetrics(true).then(() => {
                  metricsEvent({
                    eventOpts: {
                      category: 'Onboarding',
                      action: 'Metrics Option',
                      name: 'Metrics Opt In',
                    },
                    isOptIn: true,
                  });
                  hideModal();
                });
              }}
              submitText={t('affirmAgree')}
              submitButtonType="confirm"
              disabled={false}
            />
          </div>
        </div>
      </div>
    );
  }
}
