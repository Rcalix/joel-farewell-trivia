import { IsString, IsIn } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'], { message: 'La respuesta debe ser A, B, C o D' })
  answer: string;
}
