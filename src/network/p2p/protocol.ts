import { AddressInfo } from 'net';
import { err, ok, Result } from 'neverthrow';
import { isGossipMessage } from '~/types/typeguards';
import { IDRegistryEvent, Message } from '~/types';

// Network topic for all FC protocol messages
export const NETWORK_TOPIC_PRIMARY = 'f_network_topic_primary';
// Network topic for node contact info messages
export const NETWORK_TOPIC_CONTACT = 'f_network_topic_contact';
// The rate at which nodes republish their contact info
export const GOSSIP_CONTACT_INTERVAL = 10_000;
// A list of all gossip topics in use by our protocol
export const GOSSIP_TOPICS = [NETWORK_TOPIC_CONTACT, NETWORK_TOPIC_PRIMARY];

/**
 * GossipMessage defines the structure of the basic message type that is published
 * over the gossip network
 *
 * @content - The message content to be broadcasted
 * @topics - The topics this message belongs to. Multiple topics can be passed.
 */
export type GossipMessage<T = Content> = {
  content: T;
  topics: string[];
};

export type Content = IDRegistryContent | UserContent | ContactInfoContent;

/**
 * UserContent defines the structure of the primary message type that is published
 * over the gossip network.
 *
 * @message - The Farcaster Message that needs to be sent
 * @root - The current merkle root of the sender's trie
 * @count - The number of messages under the root
 */
export type UserContent = {
  message: Message;
  root: string;
  count: number;
};

/**
 * IDRegistryContent defines the structure of the IDRegistry Events that are published
 * over the gossip network.
 *
 * @message - The Farcaster IDRegistryEvent that needs to be sent
 * @root - The current merkle root of the sender's trie
 * @count - The number of messages under the root
 */
export type IDRegistryContent = {
  message: IDRegistryEvent;
  root: string;
  count: number;
};

/**
 * ContactInfoContent allows gossip nodes to share additional information about each other
 * over the gossip network.
 *
 * @peerId - The peerId of the node
 * @rpcAddress - The address at which this node is serving RPC requests. Unset if RPC is not offered.
 */
export type ContactInfoContent = {
  peerId: string;
  rpcAddress?: AddressInfo;
};

/**
 * Encodes a GossipMessage to a UTF-8 encoded array that can be broadcast over the gossip network
 *
 * @message - the GossipMessage to encode for the network
 *
 * @return - A byte array containing the UTF-8 encoded message
 */
export const encodeMessage = (message: GossipMessage): Result<Uint8Array, string> => {
  if (!isGossipMessage(message)) return err('Invalid Message');
  const json = JSON.stringify(message);
  return ok(new TextEncoder().encode(json));
};

/**
 * Decodes a GossipMessage from a UTF-8 encoded arrray
 *
 * @data - The message data
 *
 * @returns - A decoded GossipMessage from the input array
 */
export const decodeMessage = (data: Uint8Array): Result<GossipMessage, string> => {
  try {
    const json = new TextDecoder().decode(data);
    const message: GossipMessage = JSON.parse(json);

    // Error checking? exception handling?
    if (!message || !isGossipMessage(message)) {
      return err('Failed to decode Gossip message...');
    }
    return ok(message);
  } catch (error: any) {
    return err('Failed to decode Gossip message...');
  }
};
