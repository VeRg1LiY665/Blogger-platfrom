import { GamesIdsWithRowCountDto } from '../dto/games-ids-with-row-count.dto';
import { GameStatus } from '../../domain/constants/game-status.constants';

export function calculateRows(inputData: any[], questionLimit: number): GamesIdsWithRowCountDto {
    const result: GamesIdsWithRowCountDto = inputData.reduce(
        (acc, currentEntry) => {
            acc.ids.push(currentEntry.id);

            currentEntry.status == GameStatus.PendingSecondPlayer
                ? (acc.rowCount += questionLimit)
                : (acc.rowCount +=
                      questionLimit +
                      (questionLimit / 2) *
                          (currentEntry.totalNumberOfAnswers + Math.abs(currentEntry.totalNumberOfAnswers - 2)));

            return acc;
        },
        { rowCount: 0 as number, ids: [] as string[] }
    );

    return result;
}
