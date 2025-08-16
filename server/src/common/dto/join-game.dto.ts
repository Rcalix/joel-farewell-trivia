import { IsString, IsBoolean, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(20, { message: 'El nombre no puede tener más de 20 caracteres' })
  playerName: string;

  @IsBoolean()
  isJoel: boolean;
}
