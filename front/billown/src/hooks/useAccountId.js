import { useSelector } from 'react-redux';

export const useAccountId = () => {
  return useSelector(state => 
    state.auth.accountId || state.auth.user?.accountId
  );
};