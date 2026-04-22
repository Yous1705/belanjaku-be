import { PartialType } from '@nestjs/mapped-types';
import { AddAdressesDto } from './add-addresses.dto';

export class UpdateAddresses extends PartialType(AddAdressesDto) {}
