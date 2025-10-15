import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectRecordDto {
  @IsUUID()
  @ApiProperty({
    description: 'The UUID of record.',
    required: true,
  })
  id: string;
}
