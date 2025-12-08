import {useTable} from './useTable'

export function useAssignments() {
  return useTable({apiUrl: "/sales/assignments"});
}
