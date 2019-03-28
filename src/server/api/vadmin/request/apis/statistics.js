const statistics = {
  GetTopAppsByStorage: {
    permission: ['ExpenseCostVodPermissionApis']
  },
  GetTopDomainsByBandwidth: {
    permission: ['ExpenseCostVodPermissionApis']
  },
  GetTopOverseaDomainsByBandwidth: {
    permission: ['ExpenseCostVodPermissionApis']
  },
  GetStorageStatistics: {
    permission: ['ExpenseCostVodPermissionApis'],
    func: (query) => {
      return {
        query,
        timeout: 10000
      };
    }
  },
  GetBandwidthStatistics: {
    permission: ['ExpenseCostVodPermissionApis'],
    func: (query) => {
      return {
        query,
        timeout: 10000
      };
    }
  },
  GetOverseaFlowStatistics: {
    permission: ['ExpenseCostVodPermissionApis'],
    func: (query) => {
      return {
        query,
        timeout: 10000
      };
    }
  },
  ListRegions: {
    permission: ['ExpenseCostVodPermissionApis','ExpenseCostLivePermissionApis']
  },
  GetTopLiveDomainsByBandwidth: {
    permission: ['ExpenseCostLivePermissionApis']
  },
  GetLiveBandwidthStatistics: {
    permission: ['ExpenseCostLivePermissionApis']
  }
};

Object.keys(statistics).forEach(name => {
  statistics[name].permission = [...statistics[name].permission, 'ExpensePermissionApis', 'ExpenseCostPermissionApis'];
  statistics[name].service = 'trade';
});

export default statistics;