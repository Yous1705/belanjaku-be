import { IsString } from 'class-validator';

export class MidtransWebhookDto {
  @IsString()
  order_id!: string;

  @IsString()
  transaction_status!: string;

  @IsString()
  status_code!: string;

  @IsString()
  gross_amount!: string;

  @IsString()
  signature_key!: string;
}
