import { Flex, Loader as MantineLoader } from '@mantine/core'
import { type FC } from 'react'

export const Loader: FC = () => (
    <Flex align={'center'} style={{ width: '100%', height: '100%' }}>
        <MantineLoader size="sm" color="violet" variant="bars" />
    </Flex>
)