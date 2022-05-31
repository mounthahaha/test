import { DeviceUUID } from 'device-uuid';

export default () => {
  const uuid = new DeviceUUID().get();
  // console.log('uuid: ', uuid);
  return uuid;
};
