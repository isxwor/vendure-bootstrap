import { INestApplicationContext } from '@nestjs/common';
import {
    ChannelService,
    ConfigService,
    RequestContext,
    RequestContextService,
    TransactionalConnection,
    User,
} from '@vendure/core';

export async function getSuperadminContext(app: INestApplicationContext): Promise<RequestContext> {
    const { superadminCredentials } = app.get(ConfigService).authOptions;
    const channelService = app.get(ChannelService);
    const defaultChannel = await channelService.getDefaultChannel();

    const superAdminUser = await app
        .get(TransactionalConnection)
        .rawConnection.getRepository(User)
        .findOneOrFail({ where: { identifier: superadminCredentials.identifier } });
    return app.get(RequestContextService).create({
        apiType: 'admin',
        user: superAdminUser,
        channelOrToken: defaultChannel.token,
    });
}
