import now from 'performance-now';
import _checkPermission from './rbacPermission';
import aws from './aws';
import getHost from '../../../../util/host';

export const getAddress = async (service = 'admin') => {
  return getHost[service](true);
};

export function nowUs() {
  return (now() * 1000) << 0;
}

export function getVersion(service) {
  switch (service) {
  case 'trade':
  case 'rbac':
    return '';
  case 'policy':
    return '2018-01-01';
  default:
    return '2018-05-30';
  }
}

export const checkPermission = _checkPermission;
export const AWSApi = aws;