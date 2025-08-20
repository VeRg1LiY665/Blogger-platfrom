export class IatFactory {
    create() {
        const iat: number = Math.floor(Date.now());
        return {
            iat, // iat in ms for device
            refIat: Math.trunc(iat / 1000), //iat in seconds for jwt library
            rem: iat % 1000 //remainder for division - used for refresh checkup
        };
    }

    rebuild(dto: { iat: bigint; rem: number }): bigint {
        return dto.iat * 1000n + BigInt(dto.rem);
    }
}
