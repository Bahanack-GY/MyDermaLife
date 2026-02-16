import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfilePhotoDto {
    @ApiProperty({
        description: 'Base64 encoded image string (must include data:image prefix)',
        example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/, {
        message: 'Profile photo must be a valid base64 encoded image (jpeg, jpg, png, gif, or webp)',
    })
    @MaxLength(10485760, {
        message: 'Profile photo size must not exceed 10MB',
    }) // ~10MB base64 string
    profilePhoto: string;
}
