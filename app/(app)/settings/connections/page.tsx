import { getConnections } from '@/actions/connections'
import { ConnectionsClient } from './ConnectionsClient'

export default async function ConnectionsPage() {
  const { pending, accepted } = await getConnections()
  return <ConnectionsClient pending={pending as never} accepted={accepted as never} />
}
