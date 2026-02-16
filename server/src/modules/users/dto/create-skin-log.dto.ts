import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkinLogDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    photoUrl: string;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    note?: string;
}
