import { TICKET_PACKAGE_ID } from '../constants/contracts';
import { DEFAULT_NETWORK } from '../constants/networks';

export function useTicketContract() {
  return {
    packageId: TICKET_PACKAGE_ID[DEFAULT_NETWORK],
    module: 'ticket',
  };
}
