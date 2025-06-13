import { getUser1Setup, getUser2Setup } from "../setup"

export async function matchUser(identityKey : string) {
    const user1Setup = await getUser1Setup()
    const user2Setup = await getUser2Setup()

    return user1Setup.identityKey === identityKey ? user1Setup : user2Setup
}
